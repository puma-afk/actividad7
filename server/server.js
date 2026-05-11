import express from "express";
import cors from "cors";

import routes from "./routes.js";

const app = express();

app.use(cors());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 1 día
    },
  })
);

// Inicializar Passport
import passport from "./config/passport.js";
app.use(passport.initialize());
app.use(passport.session());

app.use(
  cors({
    origin: "http://localhost:5500",
    credentials: true,
  })
);

app.use(express.json());

app.use(routes);

app.listen(3000, () => {
  console.log("Servidor corriendo");
});