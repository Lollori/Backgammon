import React from 'react';
import foto9 from './Photos/foto9.png';

const Page5: React.FC = () => {
    return <div>
    <h3>Once a player has reached their home board with all their checkers (the first 6 triangles in the top-right corner for the black player, and the first 6 triangles in the bottom-right corner for the white player)
    the current player can start putting the checkers aside.</h3>
<br />
<img src={foto9} style={{width:'600px',
                         height:'500px',
                         borderRadius:'10px',
                         display:'inline-block',}}
/>
</div>
};

export default Page5;


