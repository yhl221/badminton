function charges() {
    return {
        'workingDay': {
            items: [
                {time: "09:00~12:00", unitPrice: 30},
                {time: "12:00~18:00", unitPrice: 50},
                {time: "18:00~20:00", unitPrice: 80},
                {time: "20:00~22:00", unitPrice: 60}
            ],
            discount: 0.5
        },
        'offDay': {
            items: [
                {time: "09:00~12:00", unitPrice: 40},
                {time: "12:00~18:00", unitPrice: 50},
                {time: "18:00~22:00", unitPrice: 60}
            ],
            discount: 0.25
        }
    }
}

module.exports = charges();