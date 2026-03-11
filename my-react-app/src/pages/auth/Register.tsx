import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import tomatoIllustration from "../../assets/images/Tomato_Illustration.png";
import vegetableIllustration from "../../assets/images/Vegetable_Illustration.png";

function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Validate password confirmation
        if (password !== passwordConfirmation) {
            setError("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch("http://localhost:8000/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    password_confirmation: passwordConfirmation,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                // Store token if provided
                if (data.token) {
                    localStorage.setItem("token", data.token);
                }
                // Navigate to login or home
                navigate("/login");
            } else {
                setError(data.message || "Registration failed. Please try again.");
            }
        } catch (err) {
            setError("Network error. Please make sure the backend is running.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="font-[Inter,system-ui,-apple-system,sans-serif] bg-white min-h-screen flex flex-col items-center justify-start py-12 px-4 relative overflow-x-hidden">
            {/* BEGIN: Decorative Background Images */}
            {/* Tomato illustration in top right */}
            <img alt="Tomato Illustration" className="absolute top-10 right-[120px] w-[180px] z-0 opacity-80 hidden lg:block" data-purpose="background-illustration" src={tomatoIllustration} />
            {/* Broccoli/Vegetable illustration in bottom right */}
            <img alt="Vegetable Illustration" className="absolute bottom-0 right-0 w-[350px] z-0 hidden lg:block" data-purpose="background-illustration" src={vegetableIllustration} />
            {/* END: Decorative Background Images */}
            {/* BEGIN: Registration Container */}
            <main className="w-full max-w-md flex flex-col items-center" data-purpose="registration-card">
                {/* BEGIN: Header Section */}
                <header className="text-center mb-10">
                    {/* Logo placeholder for Chicken Farm */}
                    <div className="mb-4 flex justify-center">
                        <img alt="Chicken Farm Logo" className="h-16 object-contain" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8NqzHrLyjzJn4Dom7NLfoUus45lZp_GweJymEg29XIcdvlgfDcDRg9WwXFT-lgSwC1E6GthLQb0QiMl1N7pq7iF9tWPqBZ32Cz35-4WHQdPjGc1aQqibDXTkdnvbHRedn_u04E5ttFQQUkkZncWwsxsXoTDgMCjnQANNwlhxEp3tBsMMZshCkzBLfSJbhA_g5hcZf4tdzepoPyhnEQH0KS0-h8c2jnY7ddg27pdmKimJnUrfQBhnLKxHNeG4t-6rvf25KVkoVsDA" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Create an Account</h1>
                    <p className="text-gray-500 font-medium">Please enter your details to login</p>
                </header>
                {/* END: Header Section */}
                {/* BEGIN: Signup Form */}
                <form onSubmit={handleSubmit} className="w-full space-y-5">
                    {/* Full Name Field */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[15px] font-semibold text-gray-700" htmlFor="name">Full name</label>
                        <input 
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-gray-300 text-gray-600 transition-all" 
                            id="name" 
                            type="text" 
                            placeholder="John doe" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    {/* Email Field */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[15px] font-semibold text-gray-700" htmlFor="email">Email</label>
                        <input 
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-gray-300 text-gray-600 transition-all" 
                            id="email" 
                            type="email" 
                            placeholder="hellomasqlT@gmail.com" 
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    {/* Password Field */}
                    <div className="flex flex-col gap-2 relative">
                        <label className="text-[15px] font-semibold text-gray-700" htmlFor="password">Password</label>
                        <div className="relative">
                            <input 
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-gray-300 text-gray-600 transition-all" 
                                id="password" 
                                type="password" 
                                placeholder="••••••••••••" 
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button aria-label="Toggle password visibility" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" type="button">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2.036 12.322a1.012 1.012 0 0 1 0-.644C3.414 7.066 7.729 4.167 12 4.167c4.271 0 8.586 2.899 9.964 7.511a1.012 1.012 0 0 1 0 .644c-1.378 4.509-5.693 7.408-9.964 7.408-4.271 0-8.586-2.899-9.964-7.511Z" strokeLinecap="round" strokeLinejoin="round"></path>
                                    <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" strokeLinecap="round" strokeLinejoin="round"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    {/* Confirm Password Field */}
                    <div className="flex flex-col gap-2 relative">
                        <label className="text-[15px] font-semibold text-gray-700" htmlFor="confirm-password">Confirm password</label>
                        <div className="relative">
                            <input 
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent placeholder:text-gray-300 text-gray-600 transition-all" 
                                id="confirm-password" 
                                type="password" 
                                placeholder="••••••••••••" 
                                value={passwordConfirmation}
                                onChange={(e) => setPasswordConfirmation(e.target.value)}
                                required
                            />
                            <button aria-label="Toggle password visibility" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" type="button">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M2.036 12.322a1.012 1.012 0 0 1 0-.644C3.414 7.066 7.729 4.167 12 4.167c4.271 0 8.586 2.899 9.964 7.511a1.012 1.012 0 0 1 0 .644c-1.378 4.509-5.693 7.408-9.964 7.408-4.271 0-8.586-2.899-9.964-7.511Z" strokeLinecap="round" strokeLinejoin="round"></path>
                                    <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" strokeLinecap="round" strokeLinejoin="round"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                    {/* Terms and Conditions Checkbox */}
                    <div className="flex items-center gap-3 py-2">
                        <input className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500" id="terms" name="terms" type="checkbox" required />
                        <label className="text-sm text-gray-600" htmlFor="terms">
                            I accept <a className="underline text-gray-800 font-medium" href="#">Terms and Conditions</a>
                        </label>
                    </div>
                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
                            {error}
                        </div>
                    )}
                    {/* Sign Up Button */}
                    <button 
                        className="w-full bg-[#1ab000] hover:bg-green-700 text-white font-bold py-4 rounded-xl shadow-sm transition-colors mt-4 text-lg disabled:bg-green-400 disabled:cursor-not-allowed" 
                        type="submit"
                        disabled={isLoading}
                    >
                        {isLoading ? "Signing up..." : "Sign up"}
                    </button>
                </form>
                {/* END: Signup Form */}
                {/* BEGIN: Social Divider */}
                <div className="w-full flex items-center gap-4 my-8" data-purpose="form-divider">
                    <div className="flex-grow h-px bg-gray-200"></div>
                    <span className="text-gray-400 text-sm font-medium">OR</span>
                    <div className="flex-grow h-px bg-gray-200"></div>
                </div>
                {/* END: Social Divider */}
                {/* BEGIN: Social Login */}
                <button className="w-full flex items-center justify-center gap-3 bg-[#f1f1f1] hover:bg-gray-200 py-4 rounded-xl transition-colors mb-8" data-purpose="google-login-button" type="button">
                    {/* Google Logo Icon */}
                    <svg height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"></path>
                    </svg>
                </button>
                {/* END: Social Login */}
                {/* BEGIN: Footer Links */}
                <footer className="text-center">
                    <p className="text-gray-600 font-medium">
                        Have an account? <Link className="text-blue-500 font-bold hover:underline" to="/login">
                            Log in
                        </Link>
                    </p>
                </footer>
                {/* END: Footer Links */}
            </main>
            {/* END: Registration Container */}
        </div>
    )
}
export default Register
