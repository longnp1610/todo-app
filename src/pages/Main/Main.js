import React, { useState, useEffect } from "react";
import { DragDropContext } from "react-beautiful-dnd";
import "./Main.css";
import Header from "../../components/Header/Header";
import Card from "../../components/Card/Card";
import { CardSetService } from "../../services/cardsetService";
import { CardService } from "../../services/cardService";
import { TaskService } from "../../services/taskService";

function Main() {
  const [data, setData] = useState([]);
  const [source, setSource] = useState(null);
  const [destination, setDestination] = useState(null);

  // GET DATA WHEN RENDER VIEW
  useEffect(() => {
    CardSetService.getCardSetByUserID(
      JSON.parse(sessionStorage["user"]).id
    ).then((cardSet) => {
      CardService.getCardByCardSetID(cardSet.id).then((cards) => {
        setData(
          cards.map((card) => {
            TaskService.getTaskByCardID(card.id).then((task) => {
              card["items"] = task;
            });
            return card;
          })
        );
      });
    });
  }, []);

  const onDragEnd = async ({ destination, source }) => {
    if (!destination) return;
    if (
      destination.index === source.index &&
      destination.droppableId === source.droppableId
    )
      return;

    console.log("from ", source);
    console.log("to ", destination);

    // Copy item for adding later
    let itemCopy = {};
    data.forEach((el) => {
      if (el.id === source.droppableId) {
        itemCopy = el.items[source.index];
      }
    });

    setData((prev) => {
      // Remove Item when user drag away
      prev.forEach(async (el) => {
        if (el.id === source.droppableId) {
          el.items.splice(source.index, 1);
        }
      });

      // Add Item into droppable column
      prev.forEach((el) => {
        if (el.id === destination.droppableId) {
          el.items.splice(destination.index, 0, itemCopy);
        }
      });
      return prev;
    });
    setSource(source);
    setDestination(destination);
  };

  return (
    <>
      <Header user={sessionStorage["user"]} />
      <div className="content">
        <DragDropContext onDragEnd={onDragEnd}>
          {/* {console.log("data: ", data)} */}
          {data.map((data, index) => (
            <div key={index} className="card">
              <Card data={data} source={source} destination={destination} />
            </div>
          ))}
        </DragDropContext>
      </div>
    </>
  );
}

export default Main;
