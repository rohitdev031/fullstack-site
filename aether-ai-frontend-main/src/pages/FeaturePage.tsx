import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

type FeaturePageProps = {
    title: string;
};

export function FeaturePage({ title }: FeaturePageProps) {
    const navigate = useNavigate();

    return (
        <section className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
            <p className="max-w-md text-muted-foreground">
                The {title.toLowerCase()} workspace is ready for implementation.
            </p>
            <Button onClick={() => navigate('/ask')}>
                <ArrowLeft />
                Back to Ask
            </Button>
        </section>
    );
}