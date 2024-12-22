import React from 'react';
import foto10 from './Photos/foto10.png';

const Page6: React.FC = () => {
    return <div>
    <h3>The first player that puts every checker aside wins the game!
Have fun :)</h3>
<br />
<img src={foto10} style={{width:'600px',
                         height:'500px',
                         borderRadius:'10px',
                         display:'inline-block',}}
/>
</div>
};

export default Page6;