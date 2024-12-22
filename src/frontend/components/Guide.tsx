import React, { useState } from 'react';
import Page1 from './GuidePages/page1';
import Page2 from './GuidePages/page2';
import Page3 from './GuidePages/page3';
import Page4 from './GuidePages/page4';
import Page5 from './GuidePages/page5';
import Page6 from './GuidePages/page6';


const Guide: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<number>(1);

    // Array con le pagine
    const pages = [<Page1 key={1} />, <Page2 key={2} />, <Page3 key={3} />, <Page4 key={4} />, <Page5 key={5} />, <Page6 key={6} />];

    const handleNext = () => {
        if (currentPage < pages.length) setCurrentPage(currentPage + 1);
    };

    const handlePrevious = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handlePageSelect = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <h1>Welcome to the Backgammon Guide!</h1>
            {pages[currentPage - 1]}
            <div style={{ marginTop: '20px' }}>
                <button onClick={handlePrevious} disabled={currentPage === 1}>
                    Previous
                </button>
                <button onClick={handleNext} disabled={currentPage === pages.length}>
                    Next
                </button>
            </div>
            <div style={{ marginTop: '10px' }}>
                {pages.map((_, index) => (
                    <button key={index} onClick={() => handlePageSelect(index + 1)}>
                        {index + 1}
                    </button>
                ))}
            </div>
            <div style={{ marginTop: '10px' }}>
                <button onClick={() => window.location.reload()}>
                    Back to the Menu
                </button>
            </div>
            <p>Page {currentPage} of {pages.length}</p>
            </div>
    );
};

export default Guide;

