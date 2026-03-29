import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

const App = () => {
  const [socket, setSocket] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskName, setTaskName] = useState('');

  // POŁĄCZENIE
  useEffect(() => {
    const newSocket = io('ws://localhost:8000', {
      transports: ['websocket']
    });

    setSocket(newSocket);

    // LISTENERY
    newSocket.on('updateData', (tasksFromServer) => {
      setTasks(tasksFromServer);
    });

    newSocket.on('addTask', (task) => {
      addTask(task, false);
    });

    newSocket.on('removeTask', (id) => {
      removeTask(id, false);
    });

    return () => newSocket.disconnect();
  }, []);

  // DODAWANIE TASKA
  const addTask = (task, emit = true) => {
    setTasks(prev => [...prev, task]);

    if (emit && socket) {
      socket.emit('addTask', task);
    }
  };

  // USUWANIE TASKA
  const removeTask = (id, emit = true) => {
    setTasks(prev => prev.filter(task => task.id !== id));

    if (emit && socket) {
      socket.emit('removeTask', id);
    }
  };

  // SUBMIT FORM
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!taskName) return;

    const newTask = {
      id: uuidv4(),
      name: taskName
    };

    addTask(newTask);
    setTaskName('');
  };

  return (
    <div className="App">
      <h1>ToDo List</h1>

      <ul>
        {tasks.map(task => (
          <li key={task.id}>
            {task.name}
            <button onClick={() => removeTask(task.id)}>
              Remove
            </button>
          </li>
        ))}
      </ul>

      <form onSubmit={handleSubmit}>
        <input
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          placeholder="Task name"
        />
        <button type="submit">Add</button>
      </form>
    </div>
  );
};

export default App;