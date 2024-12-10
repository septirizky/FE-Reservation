import { useNavigate } from "react-router-dom";

export const Navbar = () => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate("/");
  };

  return (
    <>
      <header className="container mx-auto max-w-md bg-purple-700">
        <div className="p-2">
          <button onClick={handleClick} className="btn btn-ghost">
            <img src="/logo_bandar.png" alt="Logo" />
          </button>
        </div>
      </header>
    </>
  );
};
