import Image from 'next/image';

interface LogoProps {
    size?: number;
    className?: string;
}

export function Logo({ size = 120, className = '' }: LogoProps) {
    return (
        <div className={`flex items-center justify-center ${className}`}>
            <Image
                src="/Complexo.jpeg"
                alt="Complexo Logo"
                width={size}
                height={size}
                className="rounded-lg object-contain aspect-square"
                priority
            />
        </div>
    );
}
