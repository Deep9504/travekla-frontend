import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext"; 
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BecomeAdvisor = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [socialLink, setSocialLink] = useState("");
  const [about, setAbout] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!user) {
        alert("Please login first!");
        navigate("/login");
        return;
    }

    try {
      // 👇 Call your new Backend Route
      await axios.put(`https://travekla-web-app.onrender.com/api/users/apply-advisor/${user._id}`, {
        socialLink,
        about
      });
      
      alert("Application Submitted! 🚀 The Admin will review it shortly.");
      navigate("/"); // Send them back home
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-2 text-center text-blue-600">Become a Travel Advisor 🌍</h2>
        <p className="text-gray-500 text-center mb-6">Earn money by planning trips for others!</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Social Link Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Instagram / YouTube Link</label>
            <input 
              type="text" 
              required
              placeholder="https://instagram.com/yourname"
              className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              value={socialLink}
              onChange={(e) => setSocialLink(e.target.value)}
            />
          </div>

          {/* About / Bio Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Why are you a pro?</label>
            <textarea 
              required
              placeholder="I have traveled to 15 countries and know the best cheap hotels..."
              className="w-full mt-1 p-2 border rounded-md focus:ring-2 focus:ring-blue-500 h-24"
              value={about}
              onChange={(e) => setAbout(e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-md font-bold hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? "Submitting..." : "Submit Application 🚀"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BecomeAdvisor;