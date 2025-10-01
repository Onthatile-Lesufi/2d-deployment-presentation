import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import styles from './GameScreen.module.css';

import whiskeyImg from '../assets/whiskey.png';
import wineImg from '../assets/wine.png';
import beerImg from '../assets/beer.png';

const initialBottles = [
  { id: '1', name: 'Whiskey', type: 'whiskey' },
  { id: '2', name: 'Wine', type: 'wine' },
  { id: '3', name: 'Beer', type: 'beer' },
];

const bottleImages = {
  whiskey: whiskeyImg,
  wine: wineImg,
  beer: beerImg,
};

const shelves = ['beer', 'wine', 'whiskey'];

const GameScreen = () => {
  const navigate = useNavigate();

  const [unsorted, setUnsorted] = useState(initialBottles);
  const [sorted, setSorted] = useState({
    beer: [],
    wine: [],
    whiskey: [],
  });

  const handleDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    if (source.droppableId === 'unsorted') {
      const moved = [...unsorted];
      const [item] = moved.splice(source.index, 1);
      const shelfItems = Array.from(sorted[destination.droppableId]);
      shelfItems.splice(destination.index, 0, item);

      setUnsorted(moved);
      setSorted({ ...sorted, [destination.droppableId]: shelfItems });
    } else if (source.droppableId !== destination.droppableId) {
      const sourceShelf = Array.from(sorted[source.droppableId]);
      const destShelf = Array.from(sorted[destination.droppableId]);
      const [item] = sourceShelf.splice(source.index, 1);
      destShelf.splice(destination.index, 0, item);

      setSorted({
        ...sorted,
        [source.droppableId]: sourceShelf,
        [destination.droppableId]: destShelf,
      });
    }
  };

  const handleSubmit = () => {
    let correct = true;

    for (const shelf of shelves) {
      for (const bottle of sorted[shelf]) {
        if (bottle.type !== shelf) {
          correct = false;
          break;
        }
      }
    }

    if (correct && unsorted.length === 0) {
      navigate('/gamesuccess');
    } else {
      navigate('/gamefailure');
    }
  };

  const handleReset = () => {
    setUnsorted(initialBottles);
    setSorted({ beer: [], wine: [], whiskey: [] });
  };

  return (
    <div className={styles.gameContainer}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className={styles.leftColumn}>
          <h2 className={styles.title}>Sort These Spirits</h2>

          <Droppable droppableId="unsorted" direction="horizontal">
            {(provided) => (
              <div
                className={styles.tray}
                ref={provided.innerRef}
                {...provided.droppableProps}
              >
                {unsorted.map((bottle, index) => (
                  <Draggable key={bottle.id} draggableId={bottle.id} index={index}>
                    {(provided) => (
                      <div
                        className={styles.bottle}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <img
                          src={bottleImages[bottle.type]}
                          alt={bottle.name}
                          className={styles.bottleImage}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <div className={styles.shelves}>
            {shelves.map((shelf) => (
              <Droppable key={shelf} droppableId={shelf}>
                {(provided) => (
                  <div
                    className={styles.shelf}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    <h3>{shelf.charAt(0).toUpperCase() + shelf.slice(1)}</h3>
                    {sorted[shelf].map((bottle, index) => (
                      <Draggable key={bottle.id} draggableId={bottle.id} index={index}>
                        {(provided) => (
                          <div
                            className={styles.bottle}
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <img
                              src={bottleImages[bottle.type]}
                              alt={bottle.name}
                              className={styles.bottleImage}
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </div>

        <div className={styles.rightColumn}>
          <p className={styles.instructions}>
            Drag each bottle to the correct shelf. When you're done, click Submit.
          </p>
          <button className={styles.button} onClick={handleSubmit}>
            <h5>Submit</h5>
          </button>
          <button className={styles.button} onClick={handleReset}>
            <h5>Reset Puzzle</h5>
          </button>
        </div>
      </DragDropContext>
    </div>
  );
};

export default GameScreen;
