import React from 'react';
import foto2 from './Photos/foto2.png';

const Page2: React.FC = () => {
    return <div>
    <h3>Each turn the current player throws two dice that might represent separate moves: 
        <br />in the example the player can move either one checker 2 spaces and one checker 5 spaces, or move just one checker 7 spaces.</h3>
<br />
<img src={foto2} style={{width:'600px',
                         height:'500px',
                         borderRadius:'10px',
                         display:'inline-block',}}
/>
</div>
};

export default Page2;


