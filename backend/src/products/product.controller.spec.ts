import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { ProductQueryDto } from './dto/product-query.dto';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  // 1. สร้าง Mock Service Object
  const mockProductsService = {
    getProducts: jest.fn(),
    getProductById: jest.fn(),
  };

  beforeEach(async () => {
    // 2. สร้าง Testing Module ของ NestJS
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService, // ใช้ Mock แทน Service จริง
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);

    // Reset ข้อมูล mock ก่อนเริ่มแต่ละ test case
    jest.clearAllMocks();
  });

  describe('getProducts (@Get)', () => {
    it('ควรเรียก productsService.getProducts และคืนค่ารายการสินค้าตามที่ Service ส่งมา', async () => {
      // Arrange (เตรียมข้อมูลจำลอง)
      const query: ProductQueryDto = { page: 1, limit: 12, search: 'shoes' };
      const expectedResult = {
        products: [
          { id: 'prod-1', name: 'Running Shoes', price: 1200 },
        ],
        total: 1,
        page: 1,
        totalPages: 1,
      };

      // Mock ให้ getProducts คืนค่าผลลัพธ์นี้
      mockProductsService.getProducts.mockResolvedValue(expectedResult);

      // Act (เรียกฟังก์ชันจริงใน Controller)
      const result = await controller.getProducts(query);

      // Assert (ตรวจสอบผลลัพธ์)
      expect(service.getProducts).toHaveBeenCalledTimes(1);
      expect(service.getProducts).toHaveBeenCalledWith(query);
      expect(result).toEqual(expectedResult);
    });

    it('ควรส่งต่อ error หาก productsService.getProducts เกิดข้อผิดพลาด', async () => {
      // Arrange
      const query: ProductQueryDto = {};
      const error = new Error('Database connection failed');
      mockProductsService.getProducts.mockRejectedValue(error);

      // Act & Assert
      await expect(controller.getProducts(query)).rejects.toThrow('Database connection failed');
      expect(service.getProducts).toHaveBeenCalledWith(query);
    });
  });
});
