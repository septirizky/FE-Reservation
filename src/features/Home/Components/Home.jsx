import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { Loading } from "../../Components/Alert/Loading";
import { Error } from "../../Components/Alert/Error";
import { getBranchCategory } from "../homeSlice";
import { Link } from "react-router-dom";

export const Home = () => {
  const dispatch = useDispatch();
  const branchCategories = useSelector((state) => state.home.branchCategories);
  const status = useSelector((state) => state.home.getBranchCategoryStatus);
  const error = useSelector((state) => state.home.error);

  useEffect(() => {
    dispatch(getBranchCategory());
  }, [dispatch]);

  return (
    <>
      <Loading status={status} />
      <Error status={status} error={error} />
      <div
        className="min-h-screen bg-gray-100 flex flex-col justify-center items-center overflow-x-hidden"
        style={{
          backgroundImage: `url(https://image-layanan.nos.jkt-1.neo.id/bg.jpeg)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Header */}
        <div className="text-center pt-8">
          <h1 className="text-5xl font-bold">Reservasi</h1>
        </div>

        {/* Kategori Branch */}
        <div className="mt-8 grid grid-cols-2 gap-8 items-center justify-center">
          {branchCategories.map((branchCategory) => (
            <Link
              key={branchCategory.branchCategoryId}
              to={`/${branchCategory.branchCategoryName}`}
              className="flex flex-col items-center justify-center bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105 w-full max-w-[150px]"
              style={{
                aspectRatio: "3/4",
              }}
            >
              <img
                src={branchCategory.branchCategoryLogoUrl}
                alt={branchCategory.branchCategoryName}
                className="w-18 h-18 object-contain mb-4"
              />
              <span className="text-2xl font-bold text-blue-800 text-center">
                {branchCategory.branchCategoryName}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};
