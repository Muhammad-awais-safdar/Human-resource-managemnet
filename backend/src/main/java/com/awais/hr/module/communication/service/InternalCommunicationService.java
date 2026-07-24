package com.awais.hr.module.communication.service;

import java.util.List;
import java.util.Map;

public interface InternalCommunicationService {
    List<Map<String, Object>> getFeedPosts();
    Map<String, Object> createFeedPost(Map<String, Object> body);
    List<Map<String, Object>> getPolls();
    Map<String, Object> createPoll(Map<String, Object> body);
}
