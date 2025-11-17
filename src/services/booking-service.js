const axios = require('axios');

const db = require('../models');
const {ServerConfig} = require('../config');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');
const { BookingRepository } = require('../repositories');

const bookingRepository = new BookingRepository();

async function createBooking(data) {
    const transaction = await db.sequelize.transaction();
    try{
        const flight = await axios.get(`${ServerConfig.WINGWISE_FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`);
        const flightData = flight.data.data;
        if(data.noOfSeats > flightData.totalSeats){
           throw new AppError("Required no of seats are not available", StatusCodes.BAD_REQUEST);
        }
        //console.log("Flight Data:", flightData);
        const totalBookingAmount = data.noOfSeats * flightData.price;
        console.log("Total Booking Amount:", totalBookingAmount);
        const bookingPayload = {...data, totalCost: totalBookingAmount};
        const booking = await bookingRepository.create(bookingPayload, transaction);

        await axios.patch(`${ServerConfig.WINGWISE_FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`, {
            seats: data.noOfSeats
        });

        await transaction.commit();
        return booking;
    }catch(error){
        await transaction.rollback();
        throw error;
    }
    
}


module.exports = {
    createBooking
}