import React from 'react';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate

interface MenuProps {
    onSelectOption: (option: string) => void;
}

const Menu: React.FC<MenuProps> = ({ onSelectOption }) => {
    const navigate = useNavigate(); // Inizializza il hook useNavigate

    // Funzione per gestire la selezione dell'opzione
    const handleSelectOption = (option: string) => {
        // Esegui la navigazione con navigate
        navigate(option);
    };

    return (
        <div className="menu-container">
            <h1 className="menu-title">Welcome to Backgammon!</h1>
            <h3>Select an option</h3>
            <div className="menu-buttons">
                <button className="menu-button" onClick={() => handleSelectOption("/Play")}>
                    Play against a computer
                </button>
                <button className="menu-button" onClick={() => handleSelectOption('/Client')}>
                    Play online
                </button>
                <button className="menu-button" onClick={() => handleSelectOption('/friends')}>
                    Friends
                </button>
                <button className="menu-button" onClick={() => handleSelectOption("/Guide")}>
                    Guide
                </button>
                <button className="menu-button" onClick={() => handleSelectOption('/Settings')}>
                    Settings
                </button>
            </div>
        </div>
    );
};

export default Menu;
