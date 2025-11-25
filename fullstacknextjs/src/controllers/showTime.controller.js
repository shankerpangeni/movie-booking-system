import ShowTime from "@/models/showTime.models";
import Hall from "@/models/hall.models";
import Screen from "@/models/screen.models";
import Movie from "@/models/movie.models";

// Create ShowTime
export const createShowTime = async (req) => {
    try {
        const { hall, screen, movie, startTime, endTime } = await req.json();

        // Basic validation: Check for overlapping shows on the same screen
        const overlappingShow = await ShowTime.findOne({
            screen,
            $or: [
                { startTime: { $lt: new Date(endTime), $gte: new Date(startTime) } },
                { endTime: { $gt: new Date(startTime), $lte: new Date(endTime) } },
            ],
        });

        if (overlappingShow) {
            return new Response(JSON.stringify({ success: false, message: "Show time overlaps with an existing show" }), { status: 400 });
        }

        const showTime = await ShowTime.create({ hall, screen, movie, startTime, endTime });
        return new Response(JSON.stringify({ success: true, showTime }), { status: 201 });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
    }
};

// Get ShowTimes (Filter by Movie or Date, or Get by ID)
export const getShowTimes = async (req) => {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        const movieId = searchParams.get("movieId");
        const date = searchParams.get("date");

        if (id) {
            const showTime = await ShowTime.findById(id)
                .populate("movie", "title poster")
                .populate("hall", "name address")
                .populate({
                    path: "screen",
                    select: "name layout"
                });
            if (!showTime) return new Response(JSON.stringify({ success: false, message: "ShowTime not found" }), { status: 404 });
            return new Response(JSON.stringify({ success: true, showTime }), { status: 200 });
        }

        let query = {};
        if (movieId) query.movie = movieId;
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            query.startTime = { $gte: startOfDay, $lte: endOfDay };
        }

        const showTimes = await ShowTime.find(query)
            .populate("movie", "title poster")
            .populate("hall", "name address")
            .populate("screen", "name");

        return new Response(JSON.stringify({ success: true, showTimes }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
    }
};

// Delete ShowTime
export const deleteShowTime = async (req, id) => {
    try {
        const showTime = await ShowTime.findByIdAndDelete(id);
        if (!showTime) {
            return new Response(JSON.stringify({ success: false, message: "ShowTime not found" }), { status: 404 });
        }
        return new Response(JSON.stringify({ success: true, message: "ShowTime deleted" }), { status: 200 });
    } catch (err) {
        return new Response(JSON.stringify({ success: false, message: err.message }), { status: 500 });
    }
};
