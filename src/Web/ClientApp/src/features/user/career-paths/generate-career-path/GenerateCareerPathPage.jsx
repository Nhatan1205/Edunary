import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import StepDescription from './components/StepDescription';
import StepTopics from './components/StepTopics';
import LoadingScreen from './components/LoadingScreen';

const LOADING_STEPS = [
    { percent: 10, label: 'Analyzing your learning profile...' },
    { percent: 25, label: 'Understanding your current skills...' },
    { percent: 50, label: 'AI is designing your personalized path...' },
    { percent: 80, label: 'Validating and optimizing results...' },
    { percent: 100, label: 'Your career path is ready!' },
];

export default function GenerateCareerPathPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);          // 1 | 2 | 'loading'
    const [description, setDescription] = useState('');
    const [selectedTopic, setSelectedTopic] = useState(null); // single id or null
    const [progress, setProgress] = useState(0);
    const [stepLabel, setStepLabel] = useState('');
    const [done, setDone] = useState(false);

    useEffect(() => {
        if (step !== 'loading') return;

        let idx = 0;
        setProgress(LOADING_STEPS[0].percent);
        setStepLabel(LOADING_STEPS[0].label);

        const interval = setInterval(() => {
            idx += 1;
            if (idx >= LOADING_STEPS.length) {
                clearInterval(interval);
                setDone(true);
                setTimeout(() => navigate('/user/career-path/1'), 1200);
                return;
            }
            setProgress(LOADING_STEPS[idx].percent);
            setStepLabel(LOADING_STEPS[idx].label);
        }, 1500);

        return () => clearInterval(interval);
    }, [step, navigate]);

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                background: (t) =>
                    `linear-gradient(160deg, ${t.palette.background.muted} 0%, ${t.palette.background.default} 60%)`,
                position: 'relative', overflow: 'hidden', py: 8,
            }}
        >
            {/* Decorative blobs */}
            <Box sx={{ position: 'absolute', top: '-10%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,167,111,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <Box sx={{ position: 'absolute', bottom: '-10%', left: '-5%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(142,51,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

            {/* Content — animate on step change */}
            <Box
                sx={{
                    width: '100%',
                    animation: 'fadeInUp 0.35s ease both',
                    '@keyframes fadeInUp': {
                        from: { opacity: 0, transform: 'translateY(16px)' },
                        to: { opacity: 1, transform: 'translateY(0)' },
                    },
                }}
                key={step}
            >
                {step === 1 && (
                    <StepDescription
                        value={description}
                        onChange={setDescription}
                        onNext={() => setStep(2)}
                    />
                )}
                {step === 2 && (
                    <StepTopics
                        selected={selectedTopic}
                        onSelect={setSelectedTopic}
                        onBack={() => setStep(1)}
                        onGenerate={() => setStep('loading')}
                    />
                )}
                {step === 'loading' && (
                    <LoadingScreen progress={progress} stepLabel={stepLabel} done={done} />
                )}
            </Box>
        </Box>
    );
}
