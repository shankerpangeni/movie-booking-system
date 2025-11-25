import Screen from "@/models/screen.models";

// Create Screen
export const createScreen = async (req) => {
    try {
        const { name, hall, layout } = await req.json();
        const screen = await Screen.create({ name, hall, layout });
        return new Response(JSON.stringify({ success: true, screen }), { status: 201 });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
    }
};

// Get Screens by Hall
export const getScreens = async (req) => {
    try {
        const { searchParams } = new URL(req.url);
        const hallId = searchParams.get("hallId");

        const query = hallId ? { hall: hallId } : {};
        const screens = await Screen.find(query).populate("hall");

        return new Response(JSON.stringify({ success: true, screens }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
    }
};

// Update Screen
export const updateScreen = async (req, id) => {
    try {
        const { name, hall, layout } = await req.json();
        const screen = await Screen.findByIdAndUpdate(
            id,
            { name, hall, layout },
            { new: true }
        ).populate("hall");
        if (!screen) {
            return new Response(JSON.stringify({ success: false, message: "Screen not found" }), { status: 404 });
        }
        return new Response(JSON.stringify({ success: true, screen }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
    }
};

// Delete Screen
export const deleteScreen = async (req, id) => {
    try {
        const screen = await Screen.findByIdAndDelete(id);
        if (!screen) {
            return new Response(JSON.stringify({ success: false, message: "Screen not found" }), { status: 404 });
        }
        return new Response(JSON.stringify({ success: true, message: "Screen deleted" }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
    }
};
