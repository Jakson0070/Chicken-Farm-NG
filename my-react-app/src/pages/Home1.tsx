import { Link } from "react-router-dom";

function Home() {
  return (
    <div>
      <h1>Home Page</h1>
      <Link to="/login" className="text-3xl font-bold text-red-500">
        Login
      </Link>
      {/* Your home page content */}
    </div>
  )
}

export default Home