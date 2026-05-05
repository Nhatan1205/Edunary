import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { toast } from 'react-toastify';
import StepDescription from './components/StepDescription';
import StepTopics from './components/StepTopics';
import LoadingScreen from './components/LoadingScreen';
import useGenerateAIRoadmap from '../../../../hooks/roadmap-hooks/useGenerateAIRoadmap';
import useRoadmapProgress from '../../../../hooks/roadmap-hooks/useRoadmapProgress';

export default function GenerateCareerPathPage() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);          // 1 | 2 | 'loading'
    const [description, setDescription] = useState('');
    const [selectedTopic, setSelectedTopic] = useState(null);

    const isGenerating = step === 'loading';

    // Server sends real milestone values with backend delays already applied
    const { percent, message: stepLabel, roadmapId } = useRoadmapProgress(isGenerating);

    // Navigate when server signals completion
    useEffect(() => {
        if (percent === 100 && roadmapId) {
            navigate(`/user/career-path/${roadmapId}`, { replace: true });
        }
        if (percent === -1) {
            toast.error(stepLabel || 'Generation failed.');
            setStep(2);
        }
    }, [percent, roadmapId, stepLabel, navigate]);

    const { mutate: generateRoadmap } = useGenerateAIRoadmap({
        onError: (error) => {
            toast.error(error?.message || 'Failed to start generation.');
            setStep(2);
        },
    });

    const handleGenerate = () => {
        if (!selectedTopic) return;
        setStep('loading');
        generateRoadmap({ description, roadmapTopicId: selectedTopic });
    };

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
            <Box sx={{ position: 'absolute', top: '-10%', right: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,167,111,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
            <Box sx={{ position: 'absolute', bottom: '-10%', left: '-5%', width: 350, height: 350, borderRadius: '50%', background: 'radial-gradient(circle, rgba(142,51,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

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
                        onGenerate={handleGenerate}
                    />
                )}
                {step === 'loading' && (
                    <LoadingScreen
                        progress={Math.max(0, percent)}
                        stepLabel={stepLabel}
                        done={percent >= 100}
                    />
                )}
            </Box>
        </Box>
    );
}
