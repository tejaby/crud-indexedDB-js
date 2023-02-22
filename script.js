let db;
const request = indexedDB.open("dataBase", 1);

request.onsuccess = () => {
  db = request.result;
  console.log("Conexión exitosa con la base de datos");
  readObject();
};

request.onerror = () => {
  console.log("Error en la conexión con la base de datos");
};

request.onupgradeneeded = () => {
  db = request.result;
  db.createObjectStore("usuarios", { autoIncrement: true });
  console.log("Base de datos actualizada");
};

const add = document.getElementById("add");
const user = document.getElementById("user");

add.addEventListener("click", () => {
  if (user.value.length > 0) {
    addObject({ user: user.value });
    user.value = "";
    readObject();
  }
});

const addObject = (user) => {
  const transaction = db.transaction("usuarios", "readwrite");
  const store = transaction.objectStore("usuarios");
  const request = store.add(user);
  request.onsuccess = () => {
    console.log("El objeto se agregó correctamente");
  };
  request.onerror = () => {
    console.error("Ocurrió un error al agregar el objeto");
  };
};

const list = document.querySelector(".container-list");

const readObject = () => {
  const transaction = db.transaction("usuarios", "readwrite");
  const store = transaction.objectStore("usuarios");
  const cursor = store.openCursor();
  list.innerHTML = "";
  const fragment = document.createDocumentFragment();
  cursor.onsuccess = () => {
    if (cursor.result) {
      let object = createHTML(cursor.result.key, cursor.result.value);
      fragment.appendChild(object);
      cursor.result.continue();
    } else {
      console.log("Todos los objetos han sido leidos correctamente");
      list.appendChild(fragment);
    }
  };
  cursor.onerror = () => {
    console.log("Ocurrio un error al leer el objeto");
  };
};

const updateObject = (user, key) => {
  const transaction = db.transaction("usuarios", "readwrite");
  const store = transaction.objectStore("usuarios");
  const request = store.put(user, key);
  request.onsuccess = () => {
    console.log("El objeto se a actualizado correctamente");
    readObject();
  };
  request.onerror = () => {
    console.error("Ocurrio un error al actulizar el objeto");
  };
};

const deleteObject = (key) => {
  const transaction = db.transaction("usuarios", "readwrite");
  const store = transaction.objectStore("usuarios");
  const request = store.delete(key);
  request.onsuccess = () => {
    console.log("El objeto se elimino correctamente");
  };
  request.onerror = () => {
    console.error("Ocurrio un error al eliminar el objeto");
  };
};

function createHTML(key, user) {
  const item = document.createElement("div");
  const input = document.createElement("input");
  const options = document.createElement("div");
  const btnUpdate = document.createElement("button");
  const btnDelete = document.createElement("button");

  item.classList.add("item");
  input.classList.add("users");
  options.classList.add("options");
  btnUpdate.classList.add("impossible");
  btnDelete.classList.add("delete");

  input.setAttribute("spellcheck", false);

  input.value = user.user;

  btnDelete.textContent = "delete";
  btnUpdate.textContent = "update";

  input.addEventListener("keyup", () => {
    btnUpdate.classList.replace("impossible", "possible");
  });

  btnUpdate.addEventListener("click", () => {
    if (btnUpdate.className === "possible") {
      updateObject({ user: input.value }, key);
      btnUpdate.classList.replace("possible", "impossible");
    }
  });

  btnDelete.addEventListener("click", () => {
    deleteObject(key);
    list.removeChild(item);
  });

  options.appendChild(btnUpdate);
  options.appendChild(btnDelete);

  item.appendChild(input);
  item.appendChild(options);

  return item;
}
