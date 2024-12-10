import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getBranch } from "../branchSlice";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Loading } from "../../Components/Alert/Loading";
import { Error } from "../../Components/Alert/Error";
import { ArrowLeftIcon } from "@heroicons/react/16/solid";

export const Branch = () => {
  const { BranchCategoryName } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const branch = useSelector((state) => state.branch.branches);
  const status = useSelector((state) => state.branch.getBranchStatus);
  const error = useSelector((state) => state.branch.error);

  useEffect(() => {
    dispatch(getBranch(BranchCategoryName));
  }, [dispatch, BranchCategoryName]);

  const handleBack = () => {
    navigate("/");
  };

  return (
    <>
      <Loading status={status} />
      <Error status={status} error={error} />
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <div className="bg-purple-700 text-white flex items-center p-4 rounded-t-lg">
          <button onClick={handleBack} className="mr-4">
            <ArrowLeftIcon className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-2xl font-bold flex-grow">
            {branch[0]?.BranchCategoryName || "Loading..."}
          </h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 p-2 rounded-lg">
          {branch.map((branch) => {
            return (
              <Link
                key={branch.BranchID}
                to={`/r/${branch.BranchCode}`}
                className="card card-compact bg-white p-2 border rounded-lg"
              >
                <img
                  src={branch.BranchImage}
                  alt={branch.BranchName}
                  className="object-cover h-80 w-full"
                />
                <div className="flex flex-col gap-1 px-1 py-3">
                  <h2 className="ml-1 font-semibold text-lg">
                    {branch.BranchName}
                  </h2>
                  <div className="flex items-center gap-1">
                    {branch.BranchPhone}
                  </div>
                  <div className="flex items-center gap-1 text-slate-500">
                    <p className="text-xs">{branch.BranchAddress}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};
