import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../env.js";
import { User } from "../models/User.js";

function genTokens(user) {
    const access = jwt.sign({ id: user._id }, env.jwtAccess, { expiresIn: "7d" });
    const refresh = jwt.sign({ id: user._id }, env.jwtRefresh, { expiresIn: "7d" });
    return { access, refresh };
}

export const register = async (req, res) => {
    const { email, password, shopName, shopAddress } = req.body;
    try {
        const hash = await bcrypt.hash(password, 10);
        const user = await User.create({ email, passwordHash: hash, shopName, shopAddress });
        return res.json({ message: "Registered", user });
    } catch (err) {
        return res.status(400).json({ error: "Email already used" });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ error: "Invalid credentials" });

    const tokens = genTokens(user);
    return res.json(tokens);
};
