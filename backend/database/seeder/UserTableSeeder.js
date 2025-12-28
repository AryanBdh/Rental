import User from "../../model/User.js";

class UserTableSeeder {
    static async run() {
        try {
            let userData = {
                name: "Admin",
                email: "admin@gmail.com",
                password: "admin123",
                role: ["admin"],
            };

            const findUser = await User.findOne({ email: userData.email });
            if (!findUser) {
                const user = new User(userData);
                await user.save();
                console.log("Admin user created successfully");
            }
        } catch (err) {
            console.error('UserTableSeeder error:', err.message || err);
            // don't rethrow — seeder failures shouldn't prevent server from starting in dev
        }
    }
}

export default UserTableSeeder;