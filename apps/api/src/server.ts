import express from 'express';

const app = express();

app.use(express.json());

app.get("/api/v1/health", (_req, res) => {
    res.json({ok: true});
}
);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});