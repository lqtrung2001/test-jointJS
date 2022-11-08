const data = [
    {
        "id": "A1",
        "type": "A"
    },
    {
        "id": "B1",
        "type": "B",
        "dependencies":
        {
            "type": 'LogicalOperator',
            "operator": "or",
            "elements": [
                {
                    "type": "Task",
                    "id": "A1",
                    "state": "ok"
                },
                {
                    "type": "LogicalOperator",
                    "operator": "and",
                    "elements": [
                        {
                            "type": "Task",
                            "id": "A3",
                            "state": "ok"
                        },
                        {
                            "type": "Task",
                            "id": "A4",
                            "state": "ok"
                        },
                        {
                            "type": "Task",
                            "id": "A5",
                            "state": "ok"
                        }
                    ]
                },
                {
                    "type": "Task",
                    "id": "A2",
                    "state": "ok"
                },
               
            ],

        }
    },
    {
        "id": "A2",
        "type": "A"
    },
    {
        "id": "A3",
        "type": "A"
    },
    {
        "id": "A4",
        "type": "A"
    },
    {
        "id": "A5",
        "type": "A"
    },
   
]
export default data