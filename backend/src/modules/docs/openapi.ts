export const openApiDocument = {
  openapi: '3.0.3',
  info: {
    title: 'TeraLead Backend API',
    version: '1.0.0',
    description: 'API for auth, patients, and AI chat orchestration'
  },
  servers: [
    {
      url: 'http://localhost:4000'
    }
  ],
  tags: [
    { name: 'Health' },
    { name: 'Auth' },
    { name: 'Patients' },
    { name: 'Chat' }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: {
              code: { type: 'string' },
              message: { type: 'string' }
            },
            required: ['code', 'message']
          }
        },
        required: ['error']
      },
      AuthInput: {
        type: 'object',
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 }
        },
        required: ['email', 'password']
      },
      AuthResponse: {
        type: 'object',
        properties: {
          token: { type: 'string' }
        },
        required: ['token']
      },
      PatientInput: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          phone: { type: 'string' },
          dob: { type: 'string', format: 'date-time' },
          medicalNotes: { type: 'string', nullable: true }
        },
        required: ['name', 'email', 'phone', 'dob']
      },
      Patient: {
        allOf: [
          { $ref: '#/components/schemas/PatientInput' },
          {
            type: 'object',
            properties: {
              id: { type: 'string', format: 'uuid' },
              userId: { type: 'string', format: 'uuid' },
              createdAt: { type: 'string', format: 'date-time' },
              updatedAt: { type: 'string', format: 'date-time' }
            },
            required: ['id', 'userId', 'createdAt', 'updatedAt']
          }
        ]
      },
      PaginatedPatients: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/Patient' }
          },
          page: { type: 'integer' },
          limit: { type: 'integer' },
          total: { type: 'integer' }
        },
        required: ['items', 'page', 'limit', 'total']
      },
      Message: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          patientId: { type: 'string', format: 'uuid' },
          role: { type: 'string', enum: ['USER', 'AI'] },
          content: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'patientId', 'role', 'content', 'createdAt']
      },
      MessageListResponse: {
        type: 'object',
        properties: {
          items: {
            type: 'array',
            items: { $ref: '#/components/schemas/Message' }
          }
        },
        required: ['items']
      },
      ChatInput: {
        type: 'object',
        properties: {
          patientId: { type: 'string', format: 'uuid' },
          message: { type: 'string' }
        },
        required: ['patientId', 'message']
      },
      ChatResponse: {
        type: 'object',
        properties: {
          reply: { type: 'string' }
        },
        required: ['reply']
      }
    }
  },
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Backend health check',
        responses: {
          '200': {
            description: 'Service is healthy'
          }
        }
      }
    },
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthInput' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Registered successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' }
              }
            }
          },
          '409': {
            description: 'Email already in use',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login a user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AuthInput' }
            }
          }
        },
        responses: {
          '200': {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AuthResponse' }
              }
            }
          },
          '401': {
            description: 'Invalid credentials',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ErrorResponse' }
              }
            }
          }
        }
      }
    },
    '/patients': {
      get: {
        tags: ['Patients'],
        summary: 'List patients',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'query',
            name: 'page',
            schema: { type: 'integer', default: 1 }
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', default: 10 }
          }
        ],
        responses: {
          '200': {
            description: 'Paginated patients',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/PaginatedPatients' }
              }
            }
          }
        }
      },
      post: {
        tags: ['Patients'],
        summary: 'Create patient',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/PatientInput' }
            }
          }
        },
        responses: {
          '201': {
            description: 'Created patient',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Patient' }
              }
            }
          }
        }
      }
    },
    '/patients/{id}': {
      get: {
        tags: ['Patients'],
        summary: 'Get patient by ID',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string', format: 'uuid' }
          }
        ],
        responses: {
          '200': {
            description: 'Patient details',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Patient' }
              }
            }
          }
        }
      },
      put: {
        tags: ['Patients'],
        summary: 'Update patient',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string', format: 'uuid' }
          }
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                allOf: [
                  { $ref: '#/components/schemas/PatientInput' }
                ]
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Updated patient',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/Patient' }
              }
            }
          }
        }
      },
      delete: {
        tags: ['Patients'],
        summary: 'Delete patient',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string', format: 'uuid' }
          }
        ],
        responses: {
          '200': {
            description: 'Delete result',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    ok: { type: 'boolean' }
                  },
                  required: ['ok']
                }
              }
            }
          }
        }
      }
    },
    '/patients/{id}/messages': {
      get: {
        tags: ['Chat'],
        summary: 'List patient messages',
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            in: 'path',
            name: 'id',
            required: true,
            schema: { type: 'string', format: 'uuid' }
          },
          {
            in: 'query',
            name: 'limit',
            schema: { type: 'integer', default: 50 }
          }
        ],
        responses: {
          '200': {
            description: 'Message history',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/MessageListResponse' }
              }
            }
          }
        }
      }
    },
    '/chat': {
      post: {
        tags: ['Chat'],
        summary: 'Create chat exchange',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ChatInput' }
            }
          }
        },
        responses: {
          '200': {
            description: 'AI reply',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ChatResponse' }
              }
            }
          }
        }
      }
    }
  }
} as const;
