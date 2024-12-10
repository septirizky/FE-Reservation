export const StepInformasi = () => {
  return (
    <>
      <div className="flex items-center">
        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-8 h-8 border-2 border-purple-900 bg-white rounded-full">
            <span className="text-purple-900 font-bold">1</span>
          </div>
          <span className="text-purple-900 mt-2">Informasi</span>
        </div>

        <div className="flex-grow h-1 bg-gray-300 mx-2"></div>

        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-8 h-8 bg-gray-300 rounded-full">
            <span className="text-gray-500 font-bold">2</span>
          </div>
          <span className="text-gray-500 mt-2">Menu</span>
        </div>

        <div className="flex-grow h-1 bg-gray-300 mx-2"></div>

        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-8 h-8 bg-gray-300 rounded-full">
            <span className="text-gray-500 font-bold">3</span>
          </div>
          <span className="text-gray-500 mt-2">Konfirmasi</span>
        </div>

        <div className="flex-grow h-1 bg-gray-300 mx-2"></div>

        <div className="flex flex-col items-center">
          <div className="flex items-center justify-center w-8 h-8 bg-gray-300 rounded-full">
            <span className="text-gray-500 font-bold">4</span>
          </div>
          <span className="text-gray-500 mt-2">Bayar</span>
        </div>
      </div>
    </>
  );
};
