import React from 'react';
import foto1 from './Photos/foto1.png';

const Page1: React.FC = () => {
    return <div>
    <h3>Backgammon is a two-player game,it's played on a board composed by 24 isosceles triangles and each player has 15 checkers (black or white).
    <br />
Here is how the checkers are arranged at the beginning of the game.</h3>
<br />
<img src={foto1} style={{width:'600px',
                         height:'500px',
                         borderRadius:'10px',
                         display:'inline-block',}}
/>;
</div>
};

export default Page1;

