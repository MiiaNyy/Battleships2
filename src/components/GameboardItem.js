import React from 'react';

import GameSpecs from "./GameSpecs";

import attackIsValid from "../game_helpers/attackIsValid";
import {
    getGridCellIds,
    isShipInThisPosition,
    isThereSunkShipInThisPosition,
    isThisPositionHit
} from "./helpers/gameboardItemHelpers";
import addNewMessageToDescription from "../game_helpers/addNewMessageToDescription";

import { Cell, GameboardGrid, FlexSecondary } from "./Styles/general";
import { getGridSize } from "../game_helpers/gridSize";


function GameboardItem(props) {
    const cellIds = getGridCellIds(props.gameLevel);
    const gridSize = getGridSize(props.gameLevel);

    const humanPlayer = props.players[0];
    const computerPlayer = props.players[1];
    const playerGrid = props.playerGrid;

    return (
        <FlexSecondary size={ gridSize }>
            <GameSpecs playerGrid={ playerGrid } humanPlayer={ humanPlayer }/>
            <div style={ {width: '100%'} }>
                <h2>{ playerGrid.name } waters</h2>
                <GameboardGrid size={ gridSize }>
                    { cellIds.map((cell)=>{
                        return <GridCell key={ cell } id={ cell } gameHandlers={ props.gameHandlers }
                                         players={ [humanPlayer, computerPlayer] } playerGrid={ playerGrid }
                                         gameOver={ props.gameOver } infoOpen={ props.infoOpen }/>
                    }) }
                </GameboardGrid>
            </div>
        </FlexSecondary>
    )
}

function GridCell(props) {
    const gameboard = props.playerGrid;
    const cellId = props.id;

    const human = props.players[0];
    const computer = props.players[1];

    // If ships is in this position, color this cell different color
    const shipPosition = isShipInThisPosition(gameboard.shipsCoordinates, cellId);
    const [hitPosition, hitMarker] = isThisPositionHit(gameboard, cellId);
    const sunkShipPosition = isThereSunkShipInThisPosition(gameboard, cellId);

    const thisIsEnemyCell = gameboard.name === 'Enemy';

    // Human player uses this function to attack enemy
    function attackEnemy() {
        const setGameOver = props.gameOver[1];
        const gameIsOver = props.gameOver[0];
        const setGameDescription = props.gameHandlers[1];
        const switchTurns = props.gameHandlers[0];

        // loops already fired shots to check if shot is valid (cannot shot twice in the same coordinate)
        const shotIsValid = human.shotIsValid(cellId);
        if ( thisIsEnemyCell && human.turn && shotIsValid ) {
            attackIsValid(gameboard, human, cellId, setGameDescription, setGameOver);
            if ( !gameIsOver ) {
                human.turnOver();
                computer.startTurn()
                setTimeout(()=>{
                    switchTurns(true);
                }, 3000);
            }
        } else if ( thisIsEnemyCell && !shotIsValid ) {
            setGameDescription((prev)=>addNewMessageToDescription(prev, 'Invalid shot, try again!'));
        }
    }

    return (
        <Cell onClick={ ()=>!props.infoOpen ? attackEnemy() : console.log('game paused') } gameLevel={ human.gameLevel }
              enemy={ thisIsEnemyCell } hitPosition={ hitPosition } hitMarker={ hitMarker }
              shipPosition={ shipPosition } shipSunk={ sunkShipPosition } id={ cellId } infoOpen={ props.infoOpen }>
            <p>{ hitMarker }</p>
        </Cell>
    )
}

export default GameboardItem;