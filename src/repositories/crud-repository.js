const { StatusCodes } = require('http-status-codes');
const AppError = require('../utils/errors/app-error');
const logger = require('../config');

class CrudRepository {
    constructor(model) {
        this.model = model;
    }

    async create(data) {
        const response = await this.model.create(data);
        return response; 
    }

    async destroy(data) {
        const response = await this.model.destroy({where: {id : data}});
         if(!response){
            throw new AppError("Data not found", StatusCodes.NOT_FOUND);
        }
        return response; 
    }

    async get(data) {
        const response = await this.model.findByPk(data);
        if(!response){
            throw new AppError("Data not found", StatusCodes.NOT_FOUND);
        }
        return response;  
    }

    async getAll() {
        const response = await this.model.findAll();
        return response; 
}

    async update(id, data) { // data-> {colName: colValue, .....}
        const response = await this.model.update(data, {where: {id : id}});
        //console.log("Response: ", response);
        if(!response){
            throw new AppError("Data not found", StatusCodes.NOT_FOUND);
        }
        return response; 
    }
    
}
module.exports = CrudRepository;