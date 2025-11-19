const axios = require('axios');

const db = require('../models');
const {ServerConfig} = require('../config');
const AppError = require('../utils/errors/app-error');
const { StatusCodes } = require('http-status-codes');
const { BookingRepository } = require('../repositories');
const {Enums} = require('../utils/common');
const {BOOKED, CANCELLED} = Enums.BOOKING_STATUS;


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

async function makePayment(data) {
    const transaction = await db.sequelize.transaction();
    try{
        //console.log("Data: ", data);    
        const bookingDetails = await bookingRepository.get(data.bookingId, transaction);
        if(bookingDetails.status == CANCELLED){
            throw new AppError("Booking is cancelled ", StatusCodes.BAD_REQUEST);
        }
        //console.log("Booking Details: ", bookingDetails);
        const bookingTime = new Date(bookingDetails.createdAt);
        const currentTime = new Date();
        if(currentTime - bookingTime > 300000){
            bookingRepository.update(data.bookingId, {status:CANCELLED}, transaction);
            throw new AppError("Booking time expired ", StatusCodes.BAD_REQUEST);
        }
        //console.log("dt: ",dt);

        if(bookingDetails.totalCost != data.totalCost){
            throw new AppError("Payment amount does not match", StatusCodes.BAD_REQUEST);
        }
        if(bookingDetails.userId != data.userId){
            throw new AppError("User corresponding to booking does not match", StatusCodes.BAD_REQUEST);
        }

        //Here, we assume that payment is successful
        const response = bookingRepository.update(data.bookingId, {status:BOOKED}, transaction);

        await transaction.commit();
    }catch(error)
    {
        await transaction.rollback();
        throw error;
    }
}


module.exports = {
    createBooking,
    makePayment
}