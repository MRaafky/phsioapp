import React, { useState, useRef, useEffect, useCallback } from 'react';
import { analyzePosture } from '../../services/geminiService';
import { PostureAnalysisResult } from '../../types';
import FooterDisclaimer from '../shared/FooterDisclaimer';

// Declare TensorFlow.js and pose-detection types in the global scope
declare const tf: any;
declare const poseDetection: any;
// Declare jsPDF global
declare const jspdf: any;

const PostureIQ: React.FC = () => {
    const [isModelLoading, setIsModelLoading] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // For Gemini analysis
    const [error, setError] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<PostureAnalysisResult | null>(null);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [timerDuration, setTimerDuration] = useState<number>(0); // 0 = no timer
    const [countdown, setCountdown] = useState<number | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const detectorRef = useRef<any>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const requestRef = useRef<number | null>(null);
    const countdownIntervalRef = useRef<any>(null);
    const isMountedRef = useRef<boolean>(true);


    // Load MoveNet model, waiting for scripts to be ready
    useEffect(() => {
        const loadModel = async () => {
            try {
                await tf.setBackend('webgl');
                const model = poseDetection.SupportedModels.MoveNet;
                const detector = await poseDetection.createDetector(model);
                detectorRef.current = detector;
                setError(null);
            } catch (err) {
                console.error("Error loading model:", err);
                setError("Failed to load the posture analysis model. Please refresh the page.");
            } finally {
                setIsModelLoading(false);
            }
        };

        const intervalId = setInterval(() => {
            if (typeof tf !== 'undefined' && typeof poseDetection !== 'undefined' && typeof tf.loadGraphModel === 'function') {
                clearInterval(intervalId);
                loadModel();
            }
        }, 100);

        return () => clearInterval(intervalId);
    }, []);

    const drawPose = (pose: any) => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext('2d');
        if (!canvas || !ctx || !videoRef.current) return;

        // Set canvas dimensions to match video
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const { keypoints } = pose;

        const findKeypoint = (name: string) => keypoints.find((kp: any) => kp.name === name);

        // Draw keypoints
        for (const kp of keypoints) {
            if (kp.score > 0.5) {
                ctx.beginPath();
                ctx.arc(kp.x, kp.y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = '#10b981'; // emerald-500
                ctx.fill();
            }
        }

        // Draw skeleton
        const adjacentPairs = poseDetection.util.getAdjacentPairs(poseDetection.SupportedModels.MoveNet);
        ctx.strokeStyle = '#059669'; // emerald-600
        ctx.lineWidth = 3;

        for (const [i, j] of adjacentPairs) {
            const kp1 = keypoints[i];
            const kp2 = keypoints[j];
            if (kp1.score > 0.5 && kp2.score > 0.5) {
                ctx.beginPath();
                ctx.moveTo(kp1.x, kp1.y);
                ctx.lineTo(kp2.x, kp2.y);
                ctx.stroke();
            }
        }

        // Draw tilt detection lines
        ctx.strokeStyle = '#f59e0b'; // amber-500 for tilt lines
        ctx.lineWidth = 4; // Thicker line

        const leftShoulder = findKeypoint('left_shoulder');
        const rightShoulder = findKeypoint('right_shoulder');
        const leftHip = findKeypoint('left_hip');
        const rightHip = findKeypoint('right_hip');

        // Draw shoulder tilt line
        if (leftShoulder && rightShoulder && leftShoulder.score > 0.5 && rightShoulder.score > 0.5) {
            ctx.beginPath();
            ctx.moveTo(leftShoulder.x, leftShoulder.y);
            ctx.lineTo(rightShoulder.x, rightShoulder.y);
            ctx.stroke();
        }

        // Draw hip tilt line
        if (leftHip && rightHip && leftHip.score > 0.5 && rightHip.score > 0.5) {
            ctx.beginPath();
            ctx.moveTo(leftHip.x, leftHip.y);
            ctx.lineTo(rightHip.x, rightHip.y);
            ctx.stroke();
        }
    };

    const detectPose = useCallback(async () => {
        if (!isMountedRef.current) return;

        if (detectorRef.current && videoRef.current && videoRef.current.readyState >= 3) {
            try {
                const poses = await detectorRef.current.estimatePoses(videoRef.current);
                if (poses && poses.length > 0 && isMountedRef.current) {
                    drawPose(poses[0]);
                }
            } catch (err) {
                console.error('Error detecting pose:', err);
            }
        }
        if (isMountedRef.current) {
            requestRef.current = requestAnimationFrame(detectPose);
        }
    }, [drawPose]);

    const startCamera = async () => {
        // Stop existing camera if running
        if (streamRef.current) {
            stopCamera();
        }

        setError(null);
        setAnalysisResult(null);
        setCapturedImage(null);
        setCountdown(null);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'user',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            if (!isMountedRef.current) {
                // Component unmounted while waiting for camera
                stream.getTracks().forEach(track => track.stop());
                return;
            }

            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    if (videoRef.current && isMountedRef.current) {
                        videoRef.current.play()
                            .then(() => {
                                if (isMountedRef.current) {
                                    setIsCameraOn(true);
                                    detectPose();
                                }
                            })
                            .catch((playErr) => {
                                console.error('Error playing video:', playErr);
                                if (isMountedRef.current) {
                                    setError('Failed to start video playback. Please try again.');
                                }
                            });
                    }
                };
            }
        } catch (err: any) {
            console.error("Camera access error:", err);
            if (!isMountedRef.current) return;

            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                setError("Camera access was denied. Please allow camera permission in your browser settings to use this feature.");
            } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                setError("No camera found. Please ensure a camera is connected and enabled.");
            } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
                setError("Camera is already in use by another application. Please close other apps using the camera and try again.");
            } else {
                setError(`An error occurred while accessing the camera: ${err.message || 'Unknown error'}`);
            }
        }
    };

    const stopCamera = () => {
        // Stop all video tracks
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                track.stop();
            });
            streamRef.current = null;
        }

        // Clear video source
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        // Clear canvas
        if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }

        // Cancel animation frame
        if (requestRef.current) {
            cancelAnimationFrame(requestRef.current);
            requestRef.current = null;
        }

        // Clear countdown timer
        if (countdownIntervalRef.current) {
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
        }

        setCountdown(null);
        setIsCameraOn(false);
    };

    // Cleanup on unmount
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
            stopCamera();
        };
    }, []);

    const captureAndAnalyze = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const video = videoRef.current;
        const ctx = canvas.getContext('2d');

        if (ctx) {
            // Note: Since we are using CSS transform to flip the display,
            // the raw video data is still unflipped.
            // If you want the captured image to match the "flipped" display, 
            // we need to transform the context before drawing.

            // Save current context state
            ctx.save();
            // Flip context horizontally
            ctx.scale(-1, 1);
            // Draw image (with negative width to account for flip)
            ctx.drawImage(video, 0, 0, -canvas.width, canvas.height);
            // Restore context state
            ctx.restore();
        }

        // Get image data
        const base64String = canvas.toDataURL('image/jpeg').split(',')[1];
        setCapturedImage(canvas.toDataURL('image/jpeg'));

        stopCamera();
        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const result = await analyzePosture(base64String, 'image/jpeg');
            setAnalysisResult(result);
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred during analysis.");
        } finally {
            setIsLoading(false);
        }
    };

    const startCaptureProcess = () => {
        if (countdownIntervalRef.current) { // If countdown is active, cancel it
            clearInterval(countdownIntervalRef.current);
            countdownIntervalRef.current = null;
            setCountdown(null);
            return;
        }

        if (timerDuration > 0) {
            setCountdown(timerDuration);
            countdownIntervalRef.current = setInterval(() => {
                setCountdown(prev => {
                    if (prev === null || prev <= 1) {
                        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
                        countdownIntervalRef.current = null;
                        captureAndAnalyze(); // Trigger capture when countdown finishes
                        return null;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            captureAndAnalyze(); // Capture immediately if no timer
        }
    };

    const handleExportPDF = () => {
        if (!analysisResult || !capturedImage) return;

        const { jsPDF } = jspdf;
        const doc = new jsPDF();

        // Title
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(22);
        doc.text('Posture Analysis Report', 105, 20, { align: 'center' });
        doc.setLineWidth(0.5);
        doc.line(10, 25, 200, 25);

        // Add captured image
        doc.addImage(capturedImage, 'JPEG', 15, 35, 180, 101); // A4 is 210mm wide

        let yPosition = 150; // Start position for text below image

        // Add Risk Level
        doc.setFontSize(16);
        doc.text('Overall Risk Level:', 15, yPosition);
        doc.setFont('helvetica', 'normal');
        doc.text(analysisResult.riskLevel, 65, yPosition);
        yPosition += 10;

        // Add Deviations
        doc.setFont('helvetica', 'bold');
        doc.text('Identified Deviations:', 15, yPosition);
        yPosition += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        analysisResult.deviations.forEach(item => {
            const text = `- ${item.area}: ${item.deviation}`;
            doc.text(text, 20, yPosition);
            yPosition += 7;
        });

        yPosition += 5; // Add some space

        // Add Recommendations
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(16);
        doc.text('Recommendations & Exercises:', 15, yPosition);
        yPosition += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);

        const recommendationsText = analysisResult.recommendations.map(rec => `- ${rec}`);
        // Use splitTextToSize to handle line wrapping
        const splitText = doc.splitTextToSize(recommendationsText.join('\n'), 175);
        doc.text(splitText, 20, yPosition);

        doc.save('Posture_Analysis_Report.pdf');
    };

    const getRiskLevelColor = (riskLevel: 'Low' | 'Medium' | 'High') => {
        switch (riskLevel) {
            case 'Low': return 'bg-green-50 text-green-700 border-green-200';
            case 'Medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'High': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-slate-50 text-slate-700 border-slate-200';
        }
    };

    return (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-slate-800 mb-2 font-heading">Posture IQ Analysis</h2>
            <p className="text-slate-500 mb-8">Use your camera for an advanced AI-powered posture assessment. Stand sideways for best results.</p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Left side: Camera View & Capture */}
                <div className="space-y-4">
                    <div className="relative w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden shadow-lg border border-slate-800">
                        <video
                            ref={videoRef}
                            className={`w-full h-full object-cover ${!isCameraOn && 'hidden'}`}
                            // FIXED: Added transform to flip video horizontally (un-mirror)
                            style={{ transform: 'scaleX(-1)' }}
                        ></video>
                        <canvas
                            ref={canvasRef}
                            className={`absolute top-0 left-0 w-full h-full object-cover ${!isCameraOn && 'hidden'}`}
                            // FIXED: Canvas must also be flipped to match the flipped video
                            style={{ transform: 'scaleX(-1)' }}
                        ></canvas>
                        {!isCameraOn && capturedImage && (
                            <img src={capturedImage} alt="Captured Posture" className="w-full h-full object-cover" />
                        )}
                        {!isCameraOn && !capturedImage && (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                                <i className="fas fa-video text-6xl mb-4 opacity-50"></i>
                                <p className="font-medium">Camera feed will appear here</p>
                            </div>
                        )}
                        {countdown !== null && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-pulse z-10">
                                <p className="text-white text-9xl font-extrabold font-heading drop-shadow-lg">
                                    {countdown}
                                </p>
                            </div>
                        )}
                    </div>

                    {isCameraOn && (
                        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                            <span className="text-slate-600 font-semibold text-sm">Timer Delay:</span>
                            <div className="flex gap-2">
                                {[0, 3, 5, 10].map(duration => (
                                    <button
                                        key={duration}
                                        onClick={() => setTimerDuration(duration)}
                                        disabled={countdown !== null}
                                        className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all ${timerDuration === duration
                                            ? 'bg-emerald-500 text-white shadow-md'
                                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                                    >
                                        {duration === 0 ? 'Off' : `${duration}s`}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}


                    <div className="flex gap-4">
                        {!isCameraOn ? (
                            <button
                                onClick={startCamera}
                                disabled={isModelLoading}
                                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:bg-slate-300 disabled:from-slate-300 disabled:to-slate-300 disabled:cursor-not-allowed transform hover:-translate-y-0.5"
                            >
                                {isModelLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <i className="fas fa-spinner fa-spin"></i> Loading AI Model...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <i className="fas fa-camera"></i> Activate Camera
                                    </span>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={startCaptureProcess}
                                disabled={isLoading}
                                className={`w-full font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5
                                    ${countdown !== null
                                        ? 'bg-red-500 hover:bg-red-600 text-white'
                                        : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                                    } disabled:opacity-75 disabled:cursor-wait`}
                            >
                                {countdown !== null ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <i className="fas fa-times"></i> Cancel Timer
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <i className="fas fa-camera-retro"></i> {timerDuration > 0 ? `Start ${timerDuration}s Timer` : 'Capture & Analyze'}
                                    </span>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                {/* Right side: Results */}
                <div className="flex flex-col h-full">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-slate-800 font-heading">Analysis Report</h3>
                        {analysisResult && (
                            <button
                                onClick={handleExportPDF}
                                className="bg-slate-100 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 font-semibold py-2 px-4 rounded-lg transition-colors text-sm border border-transparent hover:border-emerald-200"
                            >
                                <i className="fas fa-file-pdf mr-2"></i> Export PDF
                            </button>
                        )}
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-700 px-6 py-4 rounded-xl mb-6 flex items-start gap-3">
                            <i className="fas fa-exclamation-circle text-xl mt-0.5 text-red-500"></i>
                            <p>{error}</p>
                        </div>
                    )}

                    {isLoading && (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-100 shadow-sm text-center min-h-[300px]">
                            <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                            <h4 className="text-lg font-bold text-slate-800 font-heading mb-1">Analyzing Posture</h4>
                            <p className="text-slate-500">Our AI is processing your image...</p>
                        </div>
                    )}

                    {analysisResult && (
                        <div className="space-y-6 animate-fade-in">
                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                <h4 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-2">Overall Risk Level</h4>
                                <span className={`inline-block px-4 py-1.5 rounded-full text-base font-bold border ${getRiskLevelColor(analysisResult.riskLevel)}`}>
                                    {analysisResult.riskLevel} Risk
                                </span>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                <h4 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-4">Identified Deviations</h4>
                                <ul className="space-y-3">
                                    {analysisResult.deviations.map((item, index) => (
                                        <li key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                            <i className="fas fa-exclamation-triangle text-amber-500 mt-1"></i>
                                            <div>
                                                <span className="font-bold text-slate-800 block mb-0.5">{item.area}</span>
                                                <span className="text-slate-600 text-sm">{item.deviation}</span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                                <h4 className="font-bold text-sm text-slate-500 uppercase tracking-wider mb-4">Recommendations</h4>
                                <ul className="space-y-3">
                                    {analysisResult.recommendations.map((rec, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <div className="min-w-[24px] h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xs font-bold mt-0.5">
                                                {index + 1}
                                            </div>
                                            <span className="text-slate-700 leading-relaxed">{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {!isLoading && !analysisResult && !error && (
                        <div className="flex-1 flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-100 border-dashed text-center min-h-[300px]">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4 text-slate-300">
                                <i className="fas fa-walking text-3xl"></i>
                            </div>
                            <h4 className="text-lg font-bold text-slate-700 font-heading mb-1">Ready for Analysis</h4>
                            <p className="text-slate-500 max-w-xs mx-auto">Start the camera and capture your posture to receive a detailed AI report.</p>
                        </div>
                    )}
                </div>
            </div>
            <FooterDisclaimer />
        </div>
    );
};

export default PostureIQ;