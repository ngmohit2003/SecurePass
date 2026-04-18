export default function Spinner({ size = 48 }) {
  return (
    <div className="flex justify-center items-center">
      {/* <div
        className="loading"
        style={{ width: size, height: size }}
        
   /> */}
  
    <div className="loading">
    
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
    </div>    

    </div>
  );
}
