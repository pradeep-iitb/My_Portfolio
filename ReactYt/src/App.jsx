function App() {
  return (
    <navbar className="bg-emerald-600 flex py-5 px-10 items-center justify-between">
      <h2 className="text-2xl hover:text-amber-200">MechClarity</h2>
      <div className="flex gap-6 items-center">
        <h4 className="text-xl text-blue-700 hover:text-blue-900">About</h4>
        <h4 className="text-xl text-blue-700 hover:text-blue-900">Your Account</h4>
        <h4 className="text-xl text-blue-700 hover:text-blue-900">Contact us</h4>
        <h4 className="text-xl text-blue-700 hover:text-blue-900">Settings</h4>
      </div>
    </navbar>
  );
}

export default App;