"use strict";

class Worker {
  constructor({ id, firstName, lastName, age, hasKids, hireDate }) {
    this.id = id || Worker.makeId();
    this.firstName = firstName;
    this.lastName = lastName;
    this.age = age;
    this.hasKids = hasKids;
    this.hireDate = hireDate;
  }

  // геттеры/сеттеры
  get firstName() {
    return this._firstName;
  }
  set firstName(v) {
    this._firstName = String(v).trim();
  }

  get lastName() {
    return this._lastName;
  }
  set lastName(v) {
    this._lastName = String(v).trim();
  }

  get age() {
    return this._age;
  }
  set age(v) {
    this._age = Number(v);
  }

  get hasKids() {
    return this._hasKids;
  }
  set hasKids(v) {
    this._hasKids = Boolean(v);
  }

  get hireDate() {
    return this._hireDate;
  }
  set hireDate(v) {
    this._hireDate = String(v);
  }

  get type() {
    return "Worker";
  }

  toJSON() {
    return {
      type: this.type,
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      age: this.age,
      hasKids: this.hasKids,
      hireDate: this.hireDate,
    };
  }

  // метод класса для удаления
  removeFrom(arr) {
    return arr.filter((item) => item.id !== this.id);
  }

  static makeId() {
    return Date.now() + "_" + Math.random().toString(16).slice(2);
  }
}

class Plumber extends Worker {
  constructor({ rank, specialty, nightShift, ...base }) {
    super(base);
    this.rank = rank;
    this.specialty = specialty;
    this.nightShift = nightShift;
  }

  get type() {
    return "Plumber";
  }

  toJSON() {
    return {
      ...super.toJSON(),
      rank: this.rank,
      specialty: this.specialty,
      nightShift: this.nightShift,
    };
  }
}

class Driver extends Worker {
  constructor({ licenseCategory, experienceYears, vehicleType, ...base }) {
    super(base);
    this.licenseCategory = licenseCategory;
    this.experienceYears = experienceYears;
    this.vehicleType = vehicleType;
  }

  get type() {
    return "Driver";
  }

  toJSON() {
    return {
      ...super.toJSON(),
      licenseCategory: this.licenseCategory,
      experienceYears: this.experienceYears,
      vehicleType: this.vehicleType,
    };
  }
}

/*  localStorage  */

const STORAGE_KEY = "workers_entities";

function save(arr) {
  const plain = arr.map((item) => item.toJSON());
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plain));
}

function revive(obj) {
  if (obj.type === "Plumber") return new Plumber(obj);
  if (obj.type === "Driver") return new Driver(obj);
  return new Worker(obj);
}

function load() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  const parsed = JSON.parse(raw);
  return parsed.map(revive);
}

/*  DOM  */

const form = document.getElementById("entityForm");
const workerType = document.getElementById("workerType");

const plumberFields = document.getElementById("plumberFields");
const driverFields = document.getElementById("driverFields");

const tbody = document.getElementById("tableBody");
const countBadge = document.getElementById("countBadge");
const clearAllBtn = document.getElementById("clearAll");

const inputs = {
  firstName: document.getElementById("firstName"),
  lastName: document.getElementById("lastName"),
  age: document.getElementById("age"),
  hasKids: document.getElementById("hasKids"),
  hireDate: document.getElementById("hireDate"),

  rank: document.getElementById("rank"),
  specialty: document.getElementById("specialty"),
  nightShift: document.getElementById("nightShift"),

  licenseCategory: document.getElementById("licenseCategory"),
  experienceYears: document.getElementById("experienceYears"),
  vehicleType: document.getElementById("vehicleType"),
};

let entities = load();
render();
toggleExtra();

workerType.addEventListener("change", toggleExtra);

form.addEventListener("submit", (e) => {
  e.preventDefault();

  if (!workerType.value) {
    alert("Выберите класс (Слесарь или Водитель)");
    return;
  }

  // базовые поля
  const base = {
    firstName: inputs.firstName.value,
    lastName: inputs.lastName.value,
    age: inputs.age.value,
    hasKids: inputs.hasKids.checked,
    hireDate: inputs.hireDate.value,
  };

  let entity;

  if (workerType.value === "Plumber") {
    entity = new Plumber({
      ...base,
      rank: inputs.rank.value,
      specialty: inputs.specialty.value,
      nightShift: inputs.nightShift.checked,
    });
  }

  if (workerType.value === "Driver") {
    entity = new Driver({
      ...base,
      licenseCategory: inputs.licenseCategory.value,
      experienceYears: inputs.experienceYears.value,
      vehicleType: inputs.vehicleType.value,
    });
  }

  entities.push(entity);
  save(entities);
  render();
  form.reset();
  toggleExtra();
});

clearAllBtn.addEventListener("click", () => {
  if (!confirm("Удалить всё?")) return;
  entities = [];
  save(entities);
  render();
});

function toggleExtra() {
  plumberFields.classList.add("hidden");
  driverFields.classList.add("hidden");

  if (workerType.value === "Plumber") plumberFields.classList.remove("hidden");
  if (workerType.value === "Driver") driverFields.classList.remove("hidden");
}

function render() {
  countBadge.textContent = entities.length;
  tbody.innerHTML = "";

  if (entities.length === 0) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 13;
    td.textContent = "Добавь первого работника";
    tr.appendChild(td);
    tbody.appendChild(tr);
    return;
  }

  entities.forEach((item) => {
    const tr = document.createElement("tr");

    // создаём ячейки
    addCell(tr, item.type);
    addCell(tr, item.firstName);
    addCell(tr, item.lastName);
    addCell(tr, item.age);
    addCell(tr, item.hasKids ? "Да" : "Нет");
    addCell(tr, item.hireDate);

    // plumber cols
    addCell(tr, item.type === "Plumber" ? item.rank : "—");
    addCell(tr, item.type === "Plumber" ? item.specialty : "—");
    addCell(
      tr,
      item.type === "Plumber" ? (item.nightShift ? "Да" : "Нет") : "—"
    );

    // driver cols
    addCell(tr, item.type === "Driver" ? item.licenseCategory : "—");
    addCell(tr, item.type === "Driver" ? item.experienceYears : "—");
    addCell(tr, item.type === "Driver" ? item.vehicleType : "—");

    // delete button
    const tdBtn = document.createElement("td");
    const btn = document.createElement("button");
    btn.className = "danger";
    btn.textContent = "Удалить";
    btn.addEventListener("click", () => {
      entities = item.removeFrom(entities); // удаление через метод
      save(entities);
      render();
    });
    tdBtn.appendChild(btn);
    tr.appendChild(tdBtn);

    tbody.appendChild(tr);
  });
}

function addCell(tr, value) {
  const td = document.createElement("td");
  td.textContent = value;
  tr.appendChild(td);
}
