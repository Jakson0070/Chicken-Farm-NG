import { useState } from "react";
import { API_BASE_URL } from "../../services/api";
import cow from "../../assets/images/cow.png";
import vegetableIllustration from "../../assets/images/Vegetable_Illustration.png";
import { Link, useNavigate } from "react-router-dom";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                // Store token if provided
                if (data.token) {
                    localStorage.setItem("token", data.token);
                }
                // Navigate to dashboard or home
                navigate("/market");
            } else {
                setError(data.message || "Login failed. Please check your credentials.");
            }
        } catch (err) {
            setError("Network error. Please make sure the backend is running.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="font-[Inter,system-ui,-apple-system,sans-serif] overflow-x-hidden bg-white min-h-screen flex items-center justify-center relative p-4">
            {/* BEGIN: Decorative Elements */}
            {/* Cow Illustration Placeholder */}
            <div className="absolute top-8 right-8 w-[250px] opacity-80 z-10 hidden md:block" data-purpose="background-decoration-top">
                <img alt="Cow" className="w-full h-auto object-contain" src={cow} />
            </div>
            {/* Vegetable/Broccoli Illustration Placeholder */}
            <div className="absolute bottom-0 right-0 w-[400px] z-10 hidden md:block" data-purpose="background-decoration-bottom">
              <img alt="Vegetable Illustration" className="w-full h-auto object-contain" src={vegetableIllustration} />
            </div>
            {/* END: Decorative Elements */}
            {/* BEGIN: Login Container */}
            <main className="w-full max-w-md bg-white z-10" data-purpose="login-form-container">
                {/* BEGIN: Header Section */}
                <header className="text-center mb-10">
                    <div className="flex justify-center mb-4">
                        {/* Logo Placeholder using the provided source for Chicken Farm logo */}
                        <img alt="Chicken Farm Logo" className="h-20 w-auto object-contain" src="/images/5 Full Logo - Black & White Background.png" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome back</h1>
                    <p className="text-gray-500">Please enter your details to login</p>
                </header>
                {/* END: Header Section */}
                {/* BEGIN: Login Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Field */}
                    <div data-purpose="input-group">
                        <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="email">Email</label>
                        <input 
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#00a800] focus:border-transparent outline-none transition-all placeholder:text-gray-400" 
                            id="email" 
                            type="email"
                            placeholder="hellomasqIT@gmail.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    {/* Password Field */}
                    <div data-purpose="input-group">
                        <div className="flex justify-between items-center mb-2">
                            <label className="block text-sm font-semibold text-gray-700" htmlFor="password">Password</label>
                            <a className="text-xs font-semibold text-blue-500 hover:underline" href="#">Forgotten password?</a>
                        </div>
                        <div className="relative">
                            <input 
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#00a800] focus:border-transparent outline-none transition-all tracking-widest" 
                                id="password" 
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" type="button">
                                {/* Visibility Icon */}
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2.036 12.322a1.012 1.012 0 0 1 0-.644C3.483 8.653 7.073 5.917 12 5.917c4.917 0 8.517 2.736 9.964 5.761a1.012 1.012 0 0 1 0 .644c-1.447 3.025-4.997 5.761-9.964 5.761-4.917 0-8.517-2.736-9.964-5.761Z" strokeLinecap="round" strokeLinejoin="round"></path>
                                    <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" strokeLinecap="round" strokeLinejoin="round"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    {/* Remember Me */}
                    <div className="flex items-center">
                        <input className="w-5 h-5 text-[#00a800] border-gray-300 rounded focus:ring-[#00a800]" id="remember" name="remember" type="checkbox"/>
                        <label className="ml-2 text-sm font-medium text-gray-600" htmlFor="remember">Remember me</label>
                    </div>
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}
                    {/* Login Button */}
                    <button 
                        className="w-full bg-[#00a800] text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-colors shadow-sm disabled:bg-green-400 disabled:cursor-not-allowed" 
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? "Logging in..." : "Login"}
                    </button>
                    {/* OR Separator */}
                    <div className="relative flex items-center justify-center py-4">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink mx-4 text-sm text-gray-400 font-medium">OR</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>
                    {/* Google Login */}
                    <button className="w-full flex items-center justify-center gap-3 bg-[#f0f0f0] py-4 rounded-xl font-semibold text-gray-700 hover:bg-gray-200 transition-colors border border-gray-100" type="button">
                        {/* Google Logo Icon */}
                        <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"></path>
                        </svg>
                    </button>
                    {/* Footer Links */}
                    <div className="text-center pt-6">
                        <p className="text-gray-700 font-medium">
                            Don't have an account? <Link className="text-blue-400 hover:underline" to="/register">
                                Register
                            </Link>
                        </p>
                    </div>
                </form>
                {/* END: Login Form */}
            </main>
            {/* END: Login Container */}
        </div>
    )
}
export default Login
