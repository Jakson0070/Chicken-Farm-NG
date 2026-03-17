import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

function PaymentCallback() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect(() => {
        // Optionally check payment status from URL params
        const status = searchParams.get('status') || searchParams.get('payment_status');
        const sessionId = searchParams.get('session_id') || searchParams.get('payment_id');

        console.log('Payment callback - Status:', status, 'Session ID:', sessionId);

        // Redirect to market page after a brief delay
        const timer = setTimeout(() => {
            navigate('/market');
        }, 1000);

        return () => clearTimeout(timer);
    }, [navigate, searchParams]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#199b1d] mx-auto mb-4"></div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Processing Payment...</h1>
                <p className="text-gray-600">Redirecting you to the market</p>
            </div>
        </div>
    );
}

export default PaymentCallback;
