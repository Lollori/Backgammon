import React from 'react';
import foto3 from './Photos/foto3.png';
import foto4 from './Photos/foto4.png';

const Page3: React.FC = () => {
    return <div>
    <h3>The current player can move the checkers to a space only if it's not occupied by 2 or more opponent's checkers.
    <br />
    The white player must move their checkers anticlockwise, while the black player, consequently, must move their checkers clockwise.
    </h3>
<br />
<img src={foto3} style={{width:'600px',
                         height:'500px',
                         borderRadius:'10px',
                         display:'inline-block',
                         marginRight:'20px'}}
/>
<img src={foto4} style={{width:'600px',
                         height:'500px',
                         borderRadius:'10px',
                         display:'inline-block',}}
/>;
</div>;
};

export default Page3;


