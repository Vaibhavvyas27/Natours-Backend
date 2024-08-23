class APIFeatures{
    constructor(query,queryString){
        this.query = query
        this.queryString = queryString
    }

    filter(){
        // Filtering
        let queryObj = {...this.queryString}
        const excludeFeilds = ['page','sort','limit','feilds','search']
        excludeFeilds.forEach(el => delete queryObj[el]);

        // Advanced Filtering
        let queryStr = JSON.stringify(queryObj)
        queryStr = queryStr.replace(/\b(gte|lt|gt|lte|ne)\b/g, match => `$${match}` )
        queryObj = JSON.parse(queryStr)
        this.query = this.query.find(queryObj)
        // let query = Tour.find(queryObj)

        return this;
    }

    sort(){
        if(this.queryString.sort){
            const sortBy =this.queryString.sort.split(',').join(' ')
            this.query = this.query.sort(sortBy)
        }
        else{
            // query = query.sort('-createdAt')  //--> BUG : facing problem with pagination 
        }
        return this;
    }

    limitFeilds(){
        if(this.queryString.feilds){
            const feilds =this.queryString.feilds.split(',').join(' ')
            this.query = this.query.select(feilds)
        }
        return this;
    }

    search() {
        if(this.queryString.search){
            const serchText = `\"${this.queryString.search}\"`
            const searchQuery = {
                $text: { $search: serchText }
            }
            console.log(searchQuery)
            this.query = this.query.find(searchQuery)
        }
        return this;
    }

    paginate() {
        const page = this.queryString.page * 1 || 1   
        const limit = this.queryString.limit * 1 || 100   
        const skipCount = (page-1)*(limit)
        this.query = this.query.skip(skipCount).limit(limit)
        return this;
    }
}
module.exports = APIFeatures;