import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DragDropContext } from "react-beautiful-dnd";
import "./Main.css";
import axios from "axios";
import Header from "../../components/Header/Header";
import Card from "../../components/Card/Card";
import AddTask from "../AddTask/AddTask";
import { AuthService } from "../../services/authService";
import { CardSetService } from "../../services/cardsetService";
import { CardService } from "../../services/cardService";
import { TaskService } from "../../services/taskService";

function Main() {
  const history = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [data, setData] = useState([]);
  const [source, setSource] = useState(null);
  const [destination, setDestination] = useState(null);
  const [isDeleteTask, setIsDeleteTask] = useState(false);
  const [isAdd, setIsAdd] = useState(false);
  const [isUpdateTask, setIsUpdateTask] = useState(false);

  useEffect(() => {
    // CHECK IF USER LOGGED IN OR NOT
    if (!sessionStorage.length) {
      history("/login");
    } else {
      const user = JSON.parse(sessionStorage["user"]);
      // CHECK ACCESS TOKEN IS VALID OT NOT
      axios.defaults.headers.common["x-access-token"] = user.accessToken;
      AuthService.authenticate()
        .then((res) => {
          if (res.statusText === "OK") {
            setIsLoggedIn(true);
            // GET DATA WHEN RENDER VIEW
            CardSetService.getCardSetByUserID(user.id).then((cardSet) => {
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
          } else {
            sessionStorage.clear();
            history("/login");
          }
        })
        .catch((err) => {
          console.log(err.response);
        });
    }
    return () => {
      setIsDeleteTask(false);
    };
  }, [history, isDeleteTask, isAdd, isUpdateTask]);

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
      {isLoggedIn !== false ? (
        isAdd === false ? (
          <>
            <Header setIsAdd={setIsAdd} />
            <div className="content">
              <DragDropContext onDragEnd={onDragEnd}>
                {/* {console.log("data: ", data)} */}
                {data.map((data, index) => (
                  <div key={index} className="card">
                    <Card
                      setIsDeleteTask={setIsDeleteTask}
                      data={data}
                      source={source}
                      destination={destination}
                      setIsUpdateTask={setIsUpdateTask}
                    />
                  </div>
                ))}
              </DragDropContext>
            </div>
          </>
        ) : (
          <AddTask setIsAdd={setIsAdd} />
        )
      ) : null}
    </>
  );
}

export default Main;
