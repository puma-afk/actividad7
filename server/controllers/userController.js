export function profile(req, res) {

  res.json({
    message: "Ruta protegida",
    user: req.user
  });

}