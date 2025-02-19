import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Model } from 'mongoose';

@Injectable()
export class MetricsService {
  constructor() {}

  async getmetrics() {
    const data = {
      users: 0,
      memberships: 0,
      mApproveds: 0,
      mRejectes: 0,
      mPending: 0,
      books: 0,
      booksBoughts: 0,
      booksPending: 0,
      purchasesByBank: [],
      membershipPurchasesByBank: [],
      mostBooksBought: [],
    };

    return data;
  }
}
