import React from 'react';
import foto6 from './Photos/foto6.png';
import foto7 from './Photos/foto7.png';

const Page4: React.FC = () => {
    return <div>
    <h3>If there's only an opponent's checker in a space, I can move my checker to that space and remove the opponent's one from the game. The next turn the opponent must firstly move the removed checker and bring it back in the game before moving the others.</h3>
<br />
<img src={foto6} style={{width:'600px',
                         height:'500px',
                         borderRadius:'10px',
                         display:'inline-block',
                         marginRight:'20px'}}
/>
<img src={foto7} style={{width:'600px',
                         height:'500px',
                         borderRadius:'10px',
                         display:'inline-block',}}
/>
</div>
};

export default Page4;

 
