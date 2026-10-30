import {Test, TestingModule} from "@nestjs/testing";
import {OrdersController} from "./orders.controller";
import {OrdersService} from "./orders.service";


describe('OrdersController',() => {
    let orderscontroller : OrdersController;
    let ordersservice : OrdersService;
    
    const mockOrdersService = {
        getOrders : jest.fn()
    };


   beforeEach(async () => {
    // 2. สร้าง Testing Module ของ NestJS
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService, // ใช้ Mock แทน Service จริง
        },
      ],
    }).compile();

    orderscontroller = module.get<OrdersController>(OrdersController);
    ordersservice = module.get<OrdersService>(OrdersService);

    jest.clearAllMocks();    
    
    });

    describe('getOrders',() => {
        it('should return orders for a user', async () => {
            // Arrange
            const userId = 'user-1';
            const page = 1;
            const limit = 10;
            const status = 'PENDING';
            
            const expectedOrders = [
                { id: 'order-1', userId, status: 'PENDING', total: 100 },
                { id: 'order-2', userId, status: 'COMPLETED', total: 200 },
            ];
            
            mockOrdersService.getOrders.mockResolvedValue(expectedOrders);
            
            // Act
            const result = await orderscontroller.getOrders(userId,page,limit,status);
            
            // Assert
            expect(result).toEqual(expectedOrders);
            expect(ordersservice.getOrders).toHaveBeenCalledWith(userId,page,limit,status);
            expect(ordersservice.getOrders).toHaveBeenCalledTimes(1);
        });
    })



});


