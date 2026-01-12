import { Invoice } from "../models/Invoice.js";

export function getInvoice(page, size, filter = {}, sort) {
    console.log(sort)
    const skip = (page - 1) * size;
    const sortField = Object.keys(sort || {})[0];
    if (sortField === 'invoiceNo') {
        return Invoice.aggregate([
            { $match: filter },
            {
                $addFields: {
                    invoiceSeq: {
                        $toInt: {
                            $arrayElemAt: [{ $split: ['$invoiceNo', '-'] }, 2]
                        }
                    }
                }
            },
            { $sort: { invoiceSeq: sort?.[sortField] || -1 } },
            { $skip: skip },
            { $limit: size },
            { $project: { invoiceSeq: 0 } }
        ]);
    }
    return Invoice.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(size)
        .lean();
}

export function getPaginationParams(query) {
    const page = Math.max(parseInt(query.page, 10) || 1, 1);
    const size = Math.min(parseInt(query.size, 10) || 2, 100);
    const name = query.name
    const status = query.status
    const sortBy = query.sortBy || 'createdAt';
    const sortOrder = query.sortOrder === 'asc' ? 1 : -1;
    return { page, size, name, status, sortBy, sortOrder };
}

export function sendResponse(res, {
    data = [],
    pagination = null,
    message = 'SUCCESS',
    status = 200,
}) {
    const response = {
        data: {
            rows: data
        },
        message: message,
        status_code: status,
        success: 1
    };
    if (pagination) {
        response.data.pagination = {
            total_pages: pagination.total_pages,
            total_rows: pagination.total_rows
        };

    }
    console.log(response)
    res.status(status).json(response);
}

export function getTotalCount(filter = {}) {
    return Invoice.countDocuments(filter);
}

export async function generateInvoiceNumber(userId) {
    const year = new Date().getFullYear();

    const lastInvoice = await Invoice.findOne({
        createdBy: userId,
        invoiceNo: { $regex: `^INV-${year}-` }
    }).sort({ createdAt: -1 }).select("invoiceNo").lean();

    let newSeq = 1;
    if (lastInvoice) {
        const lastNumber = lastInvoice.invoiceNo.split("-").pop();
        newSeq = Number(lastNumber) + 1;
    }
    return `INV-${year}-${newSeq}`
}