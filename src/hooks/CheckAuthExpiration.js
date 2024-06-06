// components/CheckAuthExpiration.js
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const CheckAuthExpiration = () => {
    const router = useRouter();

    useEffect(() => {
        const checkExpiration = () => {
            if (typeof window !== 'undefined' && window.localStorage) {
                const expirationDate = localStorage.getItem('expiration_date');

                if (expirationDate) {
                    const currentTime = new Date().getTime();
                    const expirationTime = new Date(expirationDate).getTime();

                    if (currentTime > expirationTime) {
                        localStorage.removeItem('access_token');
                        localStorage.removeItem('expiration_date');
                        router.push('/');
                    }
                } else {
                    router.push('/');
                }
            }
        };

        checkExpiration();

        const interval = setInterval(checkExpiration, 60000); // Verifique a cada minuto

        return () => clearInterval(interval);
    }, []);

    return null;
};

export default CheckAuthExpiration;
