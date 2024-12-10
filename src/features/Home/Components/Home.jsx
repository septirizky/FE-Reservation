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
        className="min-h-screen bg-gray-100 flex flex-col justify-center items-center"
        style={{
          backgroundImage: `url(https://image-layanan.nos.jkt-1.neo.id/background_1.png)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="flex-grow flex flex-col justify-center items-center w-full">
          <h1 className="text-5xl pt-2 font-bold text-gray-600">Reservasi</h1>
          {/* <p className="text-2xl italic text-black">Online</p> */}

          <div className="mt-8 space-y-4 w-10/12">
            {branchCategories.map((branchCategory) => {
              return (
                <Link
                  key={branchCategory.BranchCategoryID}
                  to={`/${branchCategory.BranchCategoryName}`}
                  className="w-full py-4 bg-white text-purple-900 rounded-full shadow-md flex justify-between items-center px-6"
                >
                  <span className="flex pl-4 items-center text-xl font-bold">
                    <img
                      src={branchCategory.LogoUrl}
                      alt="Bandar Djakarta"
                      className="w-12 h-12 mr-2"
                    />
                    {branchCategory.BranchCategoryName}
                  </span>
                  <span className="text-red-500 text-xl">▼</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};
