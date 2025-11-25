import Hall from "@/models/hall.models";

// Create Hall
export const createHall = async (req) => {
    try {
        const { name, address, description } = await req.json();
        const hall = await Hall.create({ name, address, description });
        return new Response(JSON.stringify({ success: true, hall }), { status: 201 });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
    }
};

// Get All Halls
export const getHalls = async () => {
    try {
        const halls = await Hall.find();
        return new Response(JSON.stringify({ success: true, halls }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
    }
};

// Update Hall
export const updateHall = async (req, id) => {
    try {
        const { name, address, description } = await req.json();
        const hall = await Hall.findByIdAndUpdate(
            id,
            { name, address, description },
            { new: true }
        );
        if (!hall) {
            return new Response(JSON.stringify({ success: false, message: "Hall not found" }), { status: 404 });
        }
        return new Response(JSON.stringify({ success: true, hall }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
    }
};

// Delete Hall
export const deleteHall = async (req, id) => {
    try {
        const hall = await Hall.findByIdAndDelete(id);
        if (!hall) {
            return new Response(JSON.stringify({ success: false, message: "Hall not found" }), { status: 404 });
        }
        return new Response(JSON.stringify({ success: true, message: "Hall deleted" }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
    }
};
